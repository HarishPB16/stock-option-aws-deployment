import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeScriptStudyComponent } from './type-script-study.component';

describe('TypeScriptStudyComponent', () => {
  let component: TypeScriptStudyComponent;
  let fixture: ComponentFixture<TypeScriptStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeScriptStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeScriptStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
