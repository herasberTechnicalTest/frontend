import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalsList } from './professionals-list';

describe('ProfessionalsList', () => {
  let component: ProfessionalsList;
  let fixture: ComponentFixture<ProfessionalsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
